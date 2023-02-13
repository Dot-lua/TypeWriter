const LuaHelper = {}

const Fengari = require("fengari")
const Interop = require('fengari-interop');
const Flua = require("flua");

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

LuaHelper.CreateState = function() {
    let L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
    lua.lua_pop(L, 1); /* remove lib */
    if (!L) throw Error("failed to create lua state");
    return L
}

LuaHelper.LoadString = function(Str) {
    lauxlib.luaL_loadstring(TypeWriterLuaState, to_luastring(Str));
    lua.lua_call(TypeWriterLuaState, 0, -1);
}

LuaHelper.LoadFile = function(Path) {
    LuaHelper.LoadString(require("fs").readFileSync(Path, "utf-8"))
}

module.export = LuaHelper