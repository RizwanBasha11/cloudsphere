import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dbFilePath = path.join(dataDir, 'cloudsphere.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-Memory store backed by JSON disk file
let store = {
  users: [],
  tenants: [],
  cpuAllocations: [],
  ramAllocations: [],
  cloudDatabases: [],
  storageFiles: [],
  apiKeys: [],
  activityLogs: [],
};

// Load existing data from file if present
if (fs.existsSync(dbFilePath)) {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    store = { ...store, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('[CloudSphere Store] Could not parse existing cloudsphere.json, starting fresh.', err.message);
  }
}

const persistStore = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[CloudSphere Store] Error persisting to cloudsphere.json:', err.message);
  }
};

const matchesQuery = (item, query = {}) => {
  for (const [key, val] of Object.entries(query)) {
    if (key === '_id') {
      const itemId = item._id ? item._id.toString() : '';
      const targetId = val ? (val._id ? val._id.toString() : val.toString()) : '';
      if (typeof val === 'object' && val !== null && val.$ne) {
        if (itemId === val.$ne.toString()) return false;
      } else if (targetId && itemId !== targetId) {
        return false;
      }
    } else if (key === '$or' && Array.isArray(val)) {
      const orMatch = val.some(subQuery => matchesQuery(item, subQuery));
      if (!orMatch) return false;
    } else if (typeof val === 'object' && val !== null && val.$regex) {
      const regex = new RegExp(val.$regex, val.$options || '');
      if (!regex.test(item[key] || '')) return false;
    } else if (typeof val === 'object' && val !== null && val.$ne !== undefined) {
      if (item[key] === val.$ne) return false;
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
};

const createMockModel = (collectionName, MongooseModel) => {
  return {
    async countDocuments(query = {}) {
      if (mongoose.connection.readyState === 1) {
        try {
          return await MongooseModel.countDocuments(query);
        } catch (e) {
          // fallback
        }
      }
      const list = store[collectionName] || [];
      return list.filter(item => matchesQuery(item, query)).length;
    },

    find(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return MongooseModel.find(query);
      }

      let items = (store[collectionName] || []).filter(item => matchesQuery(item, query));
      
      const queryHelper = {
        _sort: null,
        _limit: null,
        sort(sortArg) {
          queryHelper._sort = sortArg;
          return queryHelper;
        },
        limit(limitNum) {
          queryHelper._limit = limitNum;
          return queryHelper;
        },
        select(selectArg) {
          return queryHelper;
        },
        populate(popArg) {
          return queryHelper;
        },
        then(resolve, reject) {
          let result = [...items];
          if (queryHelper._sort) {
            const [sortKey, sortDir] = Object.entries(queryHelper._sort)[0] || ['createdAt', -1];
            result.sort((a, b) => {
              const valA = new Date(a[sortKey] || 0).getTime() || a[sortKey] || 0;
              const valB = new Date(b[sortKey] || 0).getTime() || b[sortKey] || 0;
              return sortDir === -1 ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
            });
          }
          if (queryHelper._limit) {
            result = result.slice(0, queryHelper._limit);
          }
          resolve(result);
        },
      };

      return queryHelper;
    },

    findOne(query = {}) {
      if (mongoose.connection.readyState === 1) {
        return MongooseModel.findOne(query);
      }

      const helper = {
        _select: null,
        select(sel) {
          helper._select = sel;
          return helper;
        },
        populate() {
          return helper;
        },
        sort() {
          return helper;
        },
        then(resolve, reject) {
          try {
            const list = store[collectionName] || [];
            const found = list.find(item => matchesQuery(item, query));
            if (!found) return resolve(null);

            const doc = {
              ...found,
              toObject() { return { ...found }; },
              async save() {
                const idx = list.findIndex(i => i._id === found._id);
                if (idx !== -1) {
                  list[idx] = { ...this, updatedAt: new Date() };
                  persistStore();
                }
                return this;
              },
            };
            resolve(doc);
          } catch (err) {
            if (reject) reject(err);
            else throw err;
          }
        },
      };

      return helper;
    },

    findById(id) {
      if (mongoose.connection.readyState === 1) {
        return MongooseModel.findById(id);
      }
      return this.findOne({ _id: id });
    },

    async create(docOrDocs) {
      if (mongoose.connection.readyState === 1) {
        try {
          return await MongooseModel.create(docOrDocs);
        } catch (e) {
          // fallback
        }
      }
      const list = store[collectionName] || (store[collectionName] = []);
      const isArray = Array.isArray(docOrDocs);
      const docs = isArray ? docOrDocs : [docOrDocs];

      const created = docs.map(doc => {
        const item = {
          _id: doc._id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...doc,
          createdAt: doc.createdAt || new Date(),
          updatedAt: new Date(),
        };
        item.save = async function() {
          const idx = list.findIndex(i => i._id === this._id);
          if (idx !== -1) {
            list[idx] = { ...this, updatedAt: new Date() };
            persistStore();
          }
          return this;
        };
        item.toObject = function() { return { ...this }; };
        list.push(item);
        return item;
      });

      persistStore();
      return isArray ? created : created[0];
    },

    async findOneAndUpdate(query, update, options = {}) {
      if (mongoose.connection.readyState === 1) {
        try {
          return await MongooseModel.findOneAndUpdate(query, update, options);
        } catch (e) {
          // fallback
        }
      }
      const list = store[collectionName] || [];
      const idx = list.findIndex(item => matchesQuery(item, query));
      if (idx === -1) return null;

      list[idx] = { ...list[idx], ...update, updatedAt: new Date() };
      persistStore();
      return list[idx];
    },

    async findOneAndDelete(query) {
      if (mongoose.connection.readyState === 1) {
        try {
          return await MongooseModel.findOneAndDelete(query);
        } catch (e) {
          // fallback
        }
      }
      const list = store[collectionName] || [];
      const idx = list.findIndex(item => matchesQuery(item, query));
      if (idx === -1) return null;

      const deleted = list.splice(idx, 1)[0];
      persistStore();
      return deleted;
    },

    async deleteOne(query) {
      return this.findOneAndDelete(query);
    },
  };
};

export default createMockModel;
