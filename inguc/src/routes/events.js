const KoaRouter = require('koa-router');

const router = new KoaRouter();

async function loadEvent(ctx, next) {
  ctx.state.event = await ctx.orm.event.findByPk(ctx.params.id);
  return next();
}

router.get('events.list', '/', async (ctx) => {
  const eventsList = [{
    "id": 38,
    "name": "Pirinha",
    "organizer": 2,
    "date": "2020-06-19T04:50:41.575Z",
    "place": "Cajon del Maipo",
    "category": "carrete",
    "banner": "https://yplqsmdlg-images-1.s3.amazonaws.com/not_yet.png",
    "createdAt": "2020-06-19T04:50:41.575Z",
    "updatedAt": "2020-06-19T04:50:41.575Z"
},
{
    "id": 39,
    "name": "Cine",
    "organizer": 4,
    "date": "2020-06-19T04:50:41.575Z",
    "place": "Patio de ingenieria",
    "category": "cultura",
    "banner": "https://yplqsmdlg-images-1.s3.amazonaws.com/not_yet.png",
    "createdAt": "2020-06-19T04:50:41.575Z",
    "updatedAt": "2020-06-19T04:50:41.575Z"
}]

  switch (ctx.accepts(['json', 'html'])) {
    case 'json':
      ctx.body = eventsList;
      break;
    case 'html':
      await ctx.render('events/index', {
        eventsList,
        profilePath: (organizer) => ctx.router.url('users.profile',{ id: organizer }),
        newEventPath: ctx.router.url('events.new'),
        editEventPath: (event) => ctx.router.url('events.edit', { id: event.id }),
        deleteEventPath: (event) => ctx.router.url('events.delete', { id: event.id }),
      });
      break;
    default:
      break;
  }


});

router.get('events.new', '/new', async (ctx) => {
  const event = ctx.orm.event.build();
  await ctx.render('events/new', {
    event,
    submitEventPath: ctx.router.url('events.create'),
  });
});

router.post('events.create', '/', async (ctx) => {
  const event = ctx.orm.event.build(ctx.request.body);
  try {
    event.organizer = ctx.session.userId;
    await event.save({ fields: ['name', 'organizer', 'date', 'place', 'category', 'banner'] });
    ctx.redirect(ctx.router.url('events.list'));
  } catch (validationError) {
    await ctx.render('events/new', {
      event,
      errors: validationError.errors,
      submitEventPath: ctx.router.url('events.create'),
    });
  }
});

router.get('events.edit', '/:id/edit', loadEvent, async (ctx) => {
  const { event } = ctx.state;
  await ctx.render('events/edit', {
    event,
    submitEventPath: ctx.router.url('events.update', { id: event.id }),
  });
});

router.patch('events.update', '/:id', loadEvent, async (ctx) => {
  const { event } = ctx.state;
  try {
    const {name, organizer, date, place, category, banner } = ctx.request.body;
    await event.update({ name, organizer, date, place, category, banner });
    ctx.redirect(ctx.router.url('events.list'));
  } catch (validationError) {
    await ctx.render('events/edit', {
      event,
      errors: validationError.errors,
      submitEventPath: ctx.router.url('events.update', { id: event.id }),
    });
  }
});

router.del('events.delete', '/:id', loadEvent, async (ctx) => {
  const { event } = ctx.state;
  await event.destroy();
  ctx.redirect(ctx.router.url('events.list'));
});

module.exports = router;
