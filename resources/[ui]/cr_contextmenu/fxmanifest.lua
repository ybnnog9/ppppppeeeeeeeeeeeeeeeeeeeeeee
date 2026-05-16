fx_version 'cerulean'
game 'gta5'
lua54 'yes'
author 'Ciudad Roja Dev Team'
description 'cr_contextmenu - modulo RP serio en español'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua'
}
