const KoaRouter = require('koa-router');

const router = new KoaRouter();

const fetch = require("node-fetch");

async function loadEvent(ctx, next) {
  ctx.state.event = await ctx.orm.event.findByPk(ctx.params.id);
  return next();
}

router.get('events.list', '/', async (ctx) => {

    // Solicitamos la data de la API de nuestra CAi App
    const request = async () => {
        const url_api = "https://sheltered-chamber-94902.herokuapp.com";
        const response = await fetch(url_api + "/events", {

            // Adding method type
            method: "GET",

            // Adding headers to the request
            headers: {
                "Accept": "application/json;",
                "Content-type": "application/json;"
            }
        })
        const data_json = await response.json();
        return data_json;
    }

  switch (ctx.accepts(['json', 'html'])) {
    case 'html':
      const eventsList = await request();
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
