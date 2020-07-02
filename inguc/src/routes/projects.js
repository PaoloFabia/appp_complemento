const KoaRouter = require('koa-router');

const router = new KoaRouter();

const fetch = require("node-fetch");

async function loadProject(ctx, next) {
  ctx.state.project = await ctx.orm.project.findByPk(ctx.params.id);
  return next();
}

router.get('projects.list', '/', async (ctx) => {

  // Solicitamos la data de la API de nuestra CAi App
  const request = async () => {
    const url_api = "http://localhost:3000";
    const response = await fetch(url_api + "/projects", { 
      
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
        const projectsList = await request();
      await ctx.render('projects/index', {
        projectsList,
        newProjectPath: ctx.router.url('projects.new'),
        editProjectPath: (project) => ctx.router.url('projects.edit', { id: project.id }),
        deleteProjectPath: (project) => ctx.router.url('projects.delete', { id: project.id }),
        profilePath: (project) => ctx.router.url('projects.profile',{ id: project.id }),
      });
      break;
    default:
      break;
  }

});

router.get('projects.new', '/new', async (ctx) => {
  const project = ctx.orm.project.build();
  const usersList = await ctx.orm.user.findAll({ where: { type: 'coordinador_proyecto' }});
  await ctx.render('projects/new', {
    project,
    usersList,
    submitProjectPath: ctx.router.url('projects.create'),
  });
});

router.post('projects.create', '/', async (ctx) => {
  const project = ctx.orm.project.build(ctx.request.body);
  const usersList = await ctx.orm.user.findAll({ where: { type: 'coordinador_proyecto' }});
  try {
    await project.save({ fields: ['name', 'admin', 'date', 'contact', 'direction','description', 'image'] });
    ctx.redirect(ctx.router.url('projects.list'));
  } catch (validationError) {
    await ctx.render('projects/new', {
      project,
      usersList,
      errors: validationError.errors,
      submitProjectPath: ctx.router.url('projects.create'),
    });
  }
});

router.get('projects.edit', '/:id/edit', loadProject, async (ctx) => {
  const { project } = ctx.state;
  const usersList = await ctx.orm.user.findAll({ where: { type: 'coordinador_proyecto' }});
  await ctx.render('projects/edit', {
    project,
    usersList,
    submitProjectPath: ctx.router.url('projects.update', { id: project.id }),
  });
});

router.patch('projects.update', '/:id', loadProject, async (ctx) => {
  const { project } = ctx.state;
  const usersList = await ctx.orm.user.findAll({ where: { type: 'coordinador_proyecto' }});
  try {
    const {name, admin, date, contact, direction,description, image } = ctx.request.body;
    await project.update({ name, admin, date, contact, direction,description, image });
    ctx.redirect(ctx.router.url('projects.list'));
  } catch (validationError) {
    await ctx.render('projects/edit', {
      project,
      usersList,
      errors: validationError.errors,
      submitProjectPath: ctx.router.url('projects.update', { id: project.id }),
    });
  }
});

router.del('projects.delete', '/:id', loadProject, async (ctx) => {
  const { project } = ctx.state;
  await project.destroy();
  ctx.redirect(ctx.router.url('projects.list'));
});

router.get('projects.profile', '/:id/profile', loadProject, async (ctx) => {
  const {project} = ctx.state;

  await ctx.render('projects/profile', {
    project,
    editProjectPath: (project) => ctx.router.url('projects.edit', { id: project.id }),
    deleteProjectPath: (project) => ctx.router.url('projects.delete', { id: project.id }),
  });
});

module.exports = router;
