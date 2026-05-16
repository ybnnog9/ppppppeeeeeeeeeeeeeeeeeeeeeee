local bandas = {}

lib.callback.register('cr_gang_creator:crearBanda', function(source, payload)
    if type(payload) ~= 'table' then return {ok=false, msg='Payload inválido'} end
    if not payload.nombre or #payload.nombre < 3 then
        return {ok=false, msg='El nombre de banda es demasiado corto'}
    end

    local id = ('G%04d'):format(#bandas + 1)
    bandas[id] = {id = id,nombre = payload.nombre,color = payload.color or '#FF0000',lider = source,miembros = {source},fecha = os.date('!%Y-%m-%dT%H:%M:%SZ')}
    return {ok=true, msg='Banda creada correctamente', banda=bandas[id]}
end)
