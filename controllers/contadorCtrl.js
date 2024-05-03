const Contador  = require("../models/contadorModel");
 
 
 

const contadorCtrl = {



    Guardarcontadorr: async (req, res) => {
        try {
            // Obtener los datos del contador del cuerpo de la solicitud
            const { years, months, days, hours, minutes, seconds } = req.body;

            // Aquí podrías hacer alguna validación de los datos recibidos

            // Crear un nuevo objeto de usuario con la información del contador
            const newUser = new Contador({
                years,
                months,
                days,
                hours,
                minutes,
                seconds
            });

            // Guardar el usuario en la base de datos
            await newUser.save();

            // Respuesta exitosa al cliente
            res.status(200).json({ message: 'Counter information saved successfully' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },


  


}


module.exports = contadorCtrl