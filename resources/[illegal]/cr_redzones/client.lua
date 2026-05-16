local dentro = false

CreateThread(function()
    while true do
        local wait = 1000
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local encontrado = false

        for _, zona in ipairs(Config.Zonas) do
            local dist = #(coords - zona.centro)
            if dist < zona.radio then
                encontrado = true
                wait = 0
                DrawMarker(1, zona.centro.x, zona.centro.y, zona.centro.z - 2.0, 0.0, 0.0, 0.0, 0, 0, 0, zona.radio * 2.0, zona.radio * 2.0, 2.0, 220, 35, 35, 80, false, false, 2, false, nil, nil, false)
                if not dentro then
                    dentro = true
                    lib.notify({title='Red Zone', description='Has entrado en una zona de combate activo', type='warning'})
                end
                break
            end
        end

        if dentro and not encontrado then
            dentro = false
            lib.notify({title='Red Zone', description='Has salido de la zona de combate', type='success'})
        end

        Wait(wait)
    end
end)
