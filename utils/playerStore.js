/**
 * @author thxmasdev
 * @description Store externo de datos del player por guildId.
 * Reemplaza player.get() / player.set() que no existen en lavalink-client v2.
 */

const _store = new Map();

/**
 * @param {string} guildId
 * @param {string} key
 * @param {*} value
 */
function setPlayerData(guildId, key, value) {
    if (!_store.has(guildId)) _store.set(guildId, {});
    _store.get(guildId)[key] = value;
}

/**
 * @param {string} guildId
 * @param {string} key
 * @returns {*}
 */
function getPlayerData(guildId, key) {
    return _store.get(guildId)?.[key];
}

/**
 * @param {string} guildId
 */
function clearPlayerData(guildId) {
    _store.delete(guildId);
}

module.exports = { setPlayerData, getPlayerData, clearPlayerData };
