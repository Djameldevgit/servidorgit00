const router = require('express').Router();
const servicioCtrl = require('../controllers/servicioCtrl');
const auth = require('../middleware/auth');

router.get('/servicios',   servicioCtrl.getServicios);

router.post('/crearserviciopendiente', auth, servicioCtrl.createServicioPendiente);

router.get('/getserviciospendientes', auth, servicioCtrl.getServiciosPendientesss);

router.patch('/aprovarservicio/:id/aprovado', auth, servicioCtrl.aprovarServicioPendiente);

router.delete('/servicio/:id', auth, servicioCtrl.deleteServicioPendiente);

router.patch('/servicio/:id', auth, servicioCtrl.updateServicio);

router.get('/servicio/:id',   servicioCtrl.getServicio);

router.delete('/servicio/:id', auth, servicioCtrl.deleteServicio);

router.patch('/servicio/:id/like', auth, servicioCtrl.likeServicio);

router.patch('/servicio/:id/unlike', auth, servicioCtrl.unLikeServicio);

router.get('/user_servicios/:id', auth, servicioCtrl.getUserServicios);

router.get('/servicio_discover', auth, servicioCtrl.getServiciosDicover);

router.patch('/saveServicio/:id', auth, servicioCtrl.saveServicio);

router.patch('/unSaveServicio/:id', auth, servicioCtrl.unSaveServicio);

router.get('/getSaveServicios', auth, servicioCtrl.getSaveServicios);

module.exports = router;
