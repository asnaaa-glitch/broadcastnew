// ============================================================
//  api.js  –  Semua komunikasi dengan Google Apps Script
// ============================================================

const API = {
  _cache: {},
  _cacheTime: {},
  CACHE_DURATION: 30000, // Cache 30 detik
  
    async getAll(sheet) {
    // Cek cache dulu
    const now = Date.now();
    if (this._cache[sheet] && (now - this._cacheTime[sheet]) < this.CACHE_DURATION) {
      return this._cache[sheet]; // Pakai cache, gak perlu fetch ulang
    }

    try {
      const url = CONFIG.SCRIPT_URL + "?action=getAll&sheet=" + sheet + "&_=" + now;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === "success") {
        this._cache[sheet] = json.data;
        this._cacheTime[sheet] = now;
        return json.data;
      }
      
      alert("Error ambil data: " + json.message);
      return this._cache[sheet] || [];
    } catch (err) {
      alert("Gagal connect ke server! Cek koneksi internet");
      return this._cache[sheet] || [];
    }
  },

  // ── TAMBAH baris baru ────────────────────────────────────────
  async add(sheet, rowData) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "add", sheet, data: rowData }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet]; // invalidate cache
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.add]", err);
      UI.showToast("Gagal menyimpan data", "error");
      return null;
    }
  },

  // ── UPDATE baris berdasarkan ID ──────────────────────────────
  async update(sheet, id, rowData) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "update", sheet, id, data: rowData }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet];
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.update]", err);
      UI.showToast("Gagal mengupdate data", "error");
      return null;
    }
  },

  // ── DELETE baris berdasarkan ID ──────────────────────────────
  async delete(sheet, id) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "delete", sheet, id }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet];
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.delete]", err);
      UI.showToast("Gagal menghapus data", "error");
      return null;
    }
  },

  // ── GET statistik untuk dashboard ───────────────────────────
  async getStats() {
    try {
      const url = `${CONFIG.SCRIPT_URL}?action=getStats&_=${Date.now()}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "success") return json.data;
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.getStats]", err);
      return null;
    }
  },
};
