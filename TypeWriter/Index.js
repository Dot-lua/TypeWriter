const Fengari = require("fengari")
const Interop = require('fengari-interop');

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

let L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);
lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
console.log(lua.lua_gettop(L))


if (!L) throw Error("failed to create lua state");
global.hi = "ahas"

let luaCode = `
    local a = "hello world"
    for I, V in pairs(require("js").global) do print(I, V) print("") end
    print(require("js"))
    print(a)
    return a
`;
{
    lauxlib.luaL_loadstring(L, to_luastring(luaCode));
    lua.lua_call(L, 0, -1);
}
console.log(lua.lua_tojsstring(L, -1))