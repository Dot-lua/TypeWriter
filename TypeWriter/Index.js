const Fengari = require("fengari")

const luaconf  = Fengari.luaconf;
const lua      = Fengari.lua;
const lauxlib  = Fengari.lauxlib;
const lualib   = Fengari.lualib;

const L = lauxlib.luaL_newstate();

lualib.luaL_openlibs(L);

lua.lua_load(L, "print('ho')")