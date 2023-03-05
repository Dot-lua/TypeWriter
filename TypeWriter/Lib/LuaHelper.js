const LuaHelper = {}

const Fengari = require("fengari")
const Interop = require('fengari-interop');
const Path = require("path")

const lua = Fengari.lua
const lauxlib = Fengari.lauxlib
const lualib = Fengari.lualib
const to_luastring = Fengari.to_luastring

var ErrorFunc

function CreateState() {
    let L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), Interop.luaopen_js, 1);
    lua.lua_pop(L, 1); /* remove lib */
    if (!L) throw Error("failed to create lua state");

    function luvi_traceback(L) {
        if (!lua.lua_isstring(L, 1)) { /* 'message' not a string? */
            return 1;  /* keep it intact */
        } 
        lua.lua_pushglobaltable(L);
        lua.lua_getfield(L, -1, "debug");
        lua.lua_remove(L, -2);
        if (!lua.lua_istable(L, -1)) {
            lua.lua_pop(L, 1);
            return 1;
        }
        lua.lua_getfield(L, -1, "traceback");
        if (!lua.lua_isfunction(L, -1)) {
            lua.lua_pop(L, 2);
            return 1;
        }
        lua.lua_pushvalue(L, 1);  /* pass error message */
        lua.lua_pushinteger(L, 2);  /* skip this function and traceback */
        lua.lua_call(L, 2, 1);  /* call debug.traceback */
        return 1;
    }

    lua.lua_pushcfunction(L, luvi_traceback);
    ErrorFunc = lua.lua_gettop(L);


    return L
}

function Load(L, source, chunkname) {
	if (typeof source == "string")
		source = to_luastring(source);
	else if (!(source instanceof Uint8Array))
		throw new TypeError("expects an array of bytes or javascript string");

	chunkname = chunkname?to_luastring(chunkname):null;
	let ok = lauxlib.luaL_loadbuffer(L, source, null, chunkname);
	let res;
	if (ok === lua.LUA_ERRSYNTAX) {
		res = new SyntaxError(lua.lua_tojsstring(L, -1));
	} else {
		res = Interop.tojs(L, -1);
	}
	lua.lua_pop(L, 1);
	if (ok !== lua.LUA_OK) {
		throw res;
	}
    return res;
}

function LoadFile(L, FilePath) {
    const LoadOk = lauxlib.luaL_loadfile(L, FilePath)
    if (LoadOk == lua.LUA_ERRSYNTAX) {
        throw new SyntaxError(lua.lua_tojsstring(L, -1))
    }
    if (LoadOk == lua.LUA_OK) {
        const CallOk = lua.lua_pcall(L, 0, 0, ErrorFunc)
        if (CallOk !== lua.LUA_OK) {
            let e = Interop.tojs(L, -1);
            lua.lua_pop(L, 1);
            console.error(e)
        }
    }
}

module.exports = {
    CreateState,
    Load,
    LoadFile
}