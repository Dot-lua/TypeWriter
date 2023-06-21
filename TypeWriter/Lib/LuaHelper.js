const Fengari = require("fengari")
const Interop = require('fengari-interop');

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

function CreateState() {
    let L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
    lua.lua_pop(L, 1)

    lua.lua_atnativeerror(L, L => {
        console.error(lua.lua_touserdata(L, 1))
        return 1
    })

    return L
}

function Load(L, Source, ChunkName) {
    if (ChunkName) {
        ChunkName = to_luastring(ChunkName)
    } else {
        ChunkName = null
    }

    const LoadOk = lauxlib.luaL_loadbuffer(
        L,
        to_luastring(Source),
        null,
        ChunkName
    )

    var Response
    if (LoadOk == lua.LUA_ERRSYNTAX) {
        Response = new SyntaxError(lua.lua_tojsstring(L, -1))
    } else {
        Response = Interop.tojs(L, -1)
    }
    lua.lua_pop(L, 1)
    if (LoadOk !== lua.LUA_OK) {
        throw Response
    }

	return Response
}

function LoadFile(L, FilePath) {
    const LoadOk = lauxlib.luaL_loadfile(L, FilePath)
    if (LoadOk == lua.LUA_ERRSYNTAX) {
        throw new SyntaxError(lua.lua_tojsstring(L, -1))
    }
    if (LoadOk == lua.LUA_OK) {
        const CallOk = lua.lua_pcall(L, 0, 0, 0)
        if (CallOk !== lua.LUA_OK) {
            const Error = Interop.tojs(L, -1);
            lua.lua_pop(L, 1);
            throw Error
        }
    }
}

module.exports = {
    CreateState,
    Load,
    LoadFile
}