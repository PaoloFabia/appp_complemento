const KoaRouter = require('koa-router');

const router = new KoaRouter();

const fetch = require("node-fetch");

async function loadUser(ctx, next) {
  ctx.state.user = await ctx.orm.user.findByPk(ctx.params.id);
  return next();
}

router.get('users.list', '/', async (ctx) => {

    // Solicitamos la data de la API de nuestra CAi App
    const request = async () => {
        const url_api = "http://localhost:3000";
        
        const response = await fetch(url_api + "/api/users", { 

            
        
            // Adding method type 
            method: "GET", 

            // Adding headers to the request 
            headers: { 
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4LCJpYXQiOjE1OTMzOTI2MTd9.Ey_DMDwp-cf1N6mOxXFd-rDWJY86z3wv7NAizWRWWjk;"
            } 
        })
        const data_json = await response;
        return data_json;
    }
  

  switch (ctx.accepts(['json', 'html'])) {
    case 'html':
      const usersList = await request();
      await ctx.render('users/index', {
        usersList,
    
        newUserPath: ctx.router.url('users.new'),
        editUserPath: (user) => ctx.router.url('users.edit', { id: user.id }),
        deleteUserPath: (user) => ctx.router.url('users.delete', { id: user.id }),
        profilePath: (user) => ctx.router.url('users.profile',{ id: user.id }),
      });
      break;
    default:
      break;
  }
});

router.get('users.directiva', '/directiva', async (ctx) => {
  const usersList = await ctx.orm.user.findAll({ where: { type: 'directiva' }});
  await ctx.render('users/directiva', {
    usersList,
    profilePath: (user) => ctx.router.url('users.profile',{ id: user.id }),
    newMessagePath: ctx.router.url('messages.new'),
  });
});

router.get('users.new', '/new', async (ctx) => {
  const user = ctx.orm.user.build();
  await ctx.render('users/new', {
    user,
    submitUserPath: ctx.router.url('users.create'),
  });
});

router.post('users.create', '/', async (ctx) => {
  const user = ctx.orm.user.build(ctx.request.body);
  try {
    await user.save({ fields: ['name', 'position', 'email', 'phone', 'image', 'type','password'] });
    ctx.redirect(ctx.router.url('users.list'));
  } catch (validationError) {
    await ctx.render('users/new', {
      user,
      errors: validationError.errors,
      submitUserPath: ctx.router.url('users.create'),
    });
  }
});

router.get('users.edit', '/:id/edit', loadUser, async (ctx) => {
  const { user } = ctx.state;
  await ctx.render('users/edit', {
    user,
    submitUserPath: ctx.router.url('users.update', { id: user.id }),
  });
});

router.patch('users.update', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  try {
    const {name, position, email, phone, type, image} = ctx.request.body;
    await user.update({ name, position, email, phone, type, image, password});
    ctx.redirect(ctx.router.url('users.list'));
  } catch (validationError) {
    await ctx.render('users/edit', {
      user,
      errors: validationError.errors,
      submitUserPath: ctx.router.url('users.update', { id: user.id }),
    });
  }
});

router.del('users.delete', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const  events_user  = await user.getEvents();
  await Promise.all(events_user.map(event => event.destroy()));
  const  projects_user  = await user.getProjects();
  await Promise.all(projects_user.map(project => project.destroy()));
  const  messages_user  = await ctx.orm.message.findAll({ where: { receiver: user.id.toString() }});
  await Promise.all(messages_user.map(message => message.destroy()));
  await user.destroy();
  ctx.redirect(ctx.router.url('users.list'));
});

router.get('users.messages', '/:id/messages_user', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const  messages_user  = await ctx.orm.message.findAll({ where: { receiver: user.id.toString() }});
  await console.log(messages_user);
  await ctx.render('users/messages_user', {
    messages_user,
  });
});

router.get('users.events', '/:id/events_user', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const  events_user  = await user.getEvents();
  await console.log(events_user);
  await ctx.render('users/events_user', {
    events_user,
  });
});

router.get('users.projects', '/:id/projects_user', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const  projects_user  = await user.getProjects();

  await ctx.render('users/projects_user', {
    projects_user,
  });
});

router.get('users.profile', '/:id/profile', loadUser, async (ctx) => {
  const {user} = ctx.state;
  console.log(user);
  await ctx.render('users/profile', {
    user,
    projectsUserPath: (user) => ctx.router.url('users.projects', { id: user.id }),
    eventsUserPath: (user) => ctx.router.url('users.events', { id: user.id }),
    messagesUserPath: (user) => ctx.router.url('users.messages', { id: user.id }),
    newMessagePath: ctx.router.url('messages.new'),
  });
});


module.exports = router;
