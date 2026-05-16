local resourceName = 'esx_menu_list'

AddEventHandler('onResourceStart', function(res)
    if res ~= GetCurrentResourceName() then return end
    print(('[SERVER] %s cargado correctamente'):format(resourceName))
end)
