const Fengari = require("fengari")
const Interop = require('fengari-interop');
const Flua = require("flua")

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

//Create lua scope


global.TypeWriter = {}
{
    let L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
    if (!L) throw Error("failed to create lua state");
    global.TypeWriterLuaState = L
}

Flua.flua_setglobals(
    TypeWriterLuaState,
    {
        TypeWriter: global.TypeWriter
    }
)

TypeWriter.b = "asd"
let luaCode = `
    local a = "hello world"
    print(require("js"))
    print(a)
    print(TypeWriter.b)
    return a
`;
{
    lauxlib.luaL_loadstring(TypeWriterLuaState, to_luastring(luaCode));
    lua.lua_call(TypeWriterLuaState, 0, -1);
}
console.log(lua.lua_tojsstring(TypeWriterLuaState, -1))