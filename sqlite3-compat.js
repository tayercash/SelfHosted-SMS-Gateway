const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let SQL = null;

class Statement {
    constructor(sqlDb, sql) {
        this._db = sqlDb;
        this._sql = sql;
        this._stmt = sqlDb.prepare(sql);
    }

    run(...args) {
        const params = args.filter(a => !Array.isArray(a) || typeof a[a.length - 1] !== 'function');
        const flat = params.flat();
        this._stmt.bind(flat);
        while (this._stmt.step()) {}
        this._stmt.reset();
    }

    finalize() {
        this._stmt.free();
    }
}

class Database {
    constructor(filename) {
        this._filename = filename;
        this._db = null;
        this._dirty = false;
    }

    async _init() {
        if (SQL === null) {
            SQL = await initSqlJs();
        }
        if (this._filename && fs.existsSync(this._filename)) {
            const buf = fs.readFileSync(this._filename);
            this._db = new SQL.Database(buf.length > 0 ? buf : undefined);
        } else {
            this._db = new SQL.Database();
        }
    }

    _save() {
        if (this._filename && this._db) {
            const data = this._db.export();
            const dir = path.dirname(this._filename);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this._filename, Buffer.from(data));
        }
    }

    exec(sql) {
        this._db.run(sql);
        this._save();
    }

    run(sql, ...args) {
        let params = [];
        if (args.length > 0 && Array.isArray(args[0])) {
            params = args[0];
        } else if (args.length > 0) {
            params = args;
        }
        this._db.run(sql, params);
        this._save();
    }

    get(sql, ...args) {
        let params = [];
        if (args.length > 0 && Array.isArray(args[0])) {
            params = args[0];
        } else if (args.length > 0) {
            params = args;
        }
        const stmt = this._db.prepare(sql);
        stmt.bind(params);
        let row = null;
        if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const values = stmt.get();
            row = {};
            cols.forEach((c, i) => { row[c] = values[i]; });
        }
        stmt.free();
        return row;
    }

    all(sql, ...args) {
        let params = [];
        if (args.length > 0 && Array.isArray(args[0])) {
            params = args[0];
        } else if (args.length > 0) {
            params = args;
        }
        const stmt = this._db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            const cols = stmt.getColumnNames();
            const values = stmt.get();
            const row = {};
            cols.forEach((c, i) => { row[c] = values[i]; });
            rows.push(row);
        }
        stmt.free();
        return rows;
    }

    prepare(sql) {
        return new Statement(this._db, sql);
    }
}

async function open({ filename }) {
    const db = new Database(filename);
    await db._init();
    return db;
}

module.exports = { open, Database };
