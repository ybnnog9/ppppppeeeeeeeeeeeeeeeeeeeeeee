RegisterCommand('crearbanda', function()
    local input = lib.inputDialog('Crear banda', {{type='input', label='Nombre de la banda', required=true, min=3, max=24},{type='color', label='Color identificativo', default='#FF0000'}})
    if not input then return end
    local result = lib.callback.await('cr_gang_creator:crearBanda', false, {nombre = input[1],color = input[2]})
    if result and result.ok then
        lib.notify({title='Bandas', description=result.msg, type='success'})
    else
        lib.notify({title='Bandas', description=(result and result.msg) or 'Error inesperado', type='error'})
    end
end, false)
