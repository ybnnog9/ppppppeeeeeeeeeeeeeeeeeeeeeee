local resourceName = 'cr_notificaciones'

AddEventHandler('onResourceStart', function(res)
    if res ~= GetCurrentResourceName() then return end
    print(('[SERVER] %s cargado correctamente'):format(resourceName))
end)
