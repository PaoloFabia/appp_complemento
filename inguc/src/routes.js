const KoaRouter = require('koa-router');

const hello = require('./routes/hello');
const index = require('./routes/index');
const events = require('./routes/events');
const projects = require('./routes/projects');
const users = require('./routes/users');

const router = new KoaRouter();

router.use('/', index.routes());
router.use('/hello', hello.routes());
router.use('/events', events.routes());
router.use('/projects', projects.routes());
router.use('/users', users.routes());

module.exports = router;
