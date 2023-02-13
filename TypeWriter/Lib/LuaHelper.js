const LuaHelper = {}

const Fengari = require("fengari")
const Interop = require('fengari-interop');
const Flua = require("flua");

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

function CreateState() {
    let L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
    lua.lua_pop(L, 1); /* remove lib */
    if (!L) throw Error("failed to create lua state");
    return L
}

function LoadString(L, Str) {
    lauxlib.luaL_loadstring(L, to_luastring(Str));
    lua.lua_call(L, 0, -1);
}

function LoadFile(L, Path) {
    LoadString(L, require("fs").readFileSync(Path, "utf-8"))
}

module.exports = {
    CreateState,
    LoadString,
    LoadFile
}