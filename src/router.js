import React from 'react';
import {
  routerRedux,
  Redirect,
  Route,
  Switch,
} from 'dva/router';
import dynamic from 'dva/dynamic';
import App from './routes/app.js';

const {
  ConnectedRouter,
} = routerRedux;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);
function RouterConfig({
  history,
  app,
}) {
  const error = dynamic({
    app,
    component: () =>
      import('./routes/error'),
  });
  const routes = [{
    path: '/home',
    // models: () => [],
    models: ['common', 'api'],
    component: () =>
      import('./routes/login/IndexPage'),
  },
  // 发起表单
  {
    path: '/table_edit/:id',
    // models: () => [
    //   import('./models/start'),
    // ],
    models: ['start'],
    component: () =>
      import('./routes/TableEdit/TableEdit'),
  },
  {
    path: '/start_grid/:type/:index/:title',
    // models: () => [
    //   import('./models/start'),
    // ],
    models: ['start'],
    component: () =>
      import('./routes/TableEdit/StartGridDetail'),
  },
  {
    path: '/addgridlist/:type/:index/:title',
    // models: () => [import('./models/start')],
    models: ['start'],
    component: () =>
      import('./routes/TableEdit/AddGridList'),
  },
  {
    path: '/approvelist',
    models: ['approve', 'list'],
    component: () =>
      import('./routes/Approved/ApproveList'),
  },
  {
    path: '/approve/:id',
    models: ['approve', 'start'],
    component: () =>
      import('./routes/Approved/ApproveDetail'),
  }, {
    path: '/approve_grid/:type/:index/:title',
    models: ['approve'],
    component: () =>
      import('./routes/Approved/ApproveGridDetail'),
  },
  {
    path: '/approve_grid_edit/:type/:index/:title',
    models: ['approve'],
    component: () =>
      import('./routes/Approved/ApproveEditGrid'),
  },
  {
    path: '/cclist',
    models: ['ccperson', 'list'],
    component: () =>
      import('./routes/CC/CCList'),
  },
  {
    path: '/cc_detail/:id',
    models: ['ccperson', 'list', 'start'],
    component: () =>
      import('./routes/CC/CCDetail'),
  },
  {
    path: '/cc_grid/:type/:index/:title',
    models: ['ccperson', 'list', 'start'],
    component: () =>
      import('./routes/CC/GridDetail'),
  },
  {
    path: '/remark',
    models: [],
    component: () =>
      import('./routes/Approved/Remark'),
  },

  {
    path: '/approve_step',
    models: ['start'],
    component: () =>
      import('./routes/Approved/SelectStep'),
  },

  {
    path: '/start_list',
    models: ['list', 'start'],
    component: () =>
      import('./routes/TableEdit/StartList'),
  },
  {
    path: '/start_detail/:id',
    models: ['start'],
    component: () =>
      import('./routes/TableEdit/StartDetail'),
  },
  {
    path: '/search_staff/:dep_id',
    models: ['start'],
    component: () =>
      import('./routes/TableEdit/StartDetail'),
  },
  // {
  //   path: '/test2',
  //   models: ['start'],
  //   component: () =>
  //     import('./routes/TableEdit/flowChart'),
  // },
  {
    path: '/imageview',
    models: [],
    component: () =>
      import('./routes/TableEdit/ImageViewer'),
  },
  {
    path: '/sel_person',
    models: ['approve', 'start', 'searchStaff'],
    component: () =>
      import('./routes/SelectPlugins/SelPerson'),
  },
  {
    path: '/sel_local_person',
    models: [],
    component: () =>
      import('./routes/SelectPlugins/LocalSelPerson'),
  },
  {
    path: '/form_sel_person',
    models: ['formSearchStaff'],
    component: () =>
      import('./routes/SelectPlugins/FormSelPerson'),
  },
  {
    path: '/form_sel_department',
    models: ['formSearchDep'],
    component: () =>
      import('./routes/SelectPlugins/SelDepartment'),
  },
  {
    path: '/form_sel_shop',
    models: ['formSearchShop'],
    component: () =>
      import('./routes/SelectPlugins/SelShop'),
  },
  {
    path: '/form_api_datasource',
    models: ['formSearchApi'],
    component: () =>
      import('./routes/SelectPlugins/SelDataSource'),
  },
  {
    path: '/my',
    models: [],
    component: () =>
      import('./routes/My/my'),
  },
  {
    path: '/tag',
    models: [],
    component: () =>
      import('./components/General/TagGroup/index.js'),
  },

  ];
  const speRoutes = [
    {
      path: '/400',
      models: [],
      component: () =>
        import('./routes/error/page400.js'),
    },
    {
      path: '/500',
      models: [],
      component: () =>
        import('./routes/error/500.js'),
    },
    {
      path: '/503',
      models: [],
      component: () =>
        import('./routes/error/503.js'),
    },
    {
      path: '/overtime',
      models: [],
      component: () =>
        import('./routes/error/overtime.js'),
    },
    {
      path: '/extrance',
      models: [],
      component: () =>
      import('./routes/login/Extrance'),
    }, {
      path: '/get_access_token',
      models: ['oauth'],

      component: () =>
      import('./routes/Oauth/GetAccessToken'),
    },
    {
      path: '/refresh_access_token',
      // models: () => [
      //   import('./models/oauth'),
      // ],
      models: ['oauth'],
      component: () =>
      import('./routes/Oauth/RefreshAccessToken'),
    },
    {
      path: '/redirect_to_authorize',
      // models: () => [
      //   import('./models/oauth'),
      // ],
      models: ['oauth'],
      component: () =>
      import('./routes/Oauth/RedirectToAuthorize'),
    }];
  return (
    <ConnectedRouter history={history}>
      <Switch>
        {speRoutes.map(({ path, models, ...dynamics }, key) => {
          const idx = key;
          models.forEach((modal) => {
            if (modelNotExisted(app, modal)) {
              app.model(import(`./models/${modal}`).default);
            }
          });
          return (
            <Route
              key={idx}
              exact
              path={path}
              component={dynamic({
                app,
                ...dynamics,
              })}
            />
          );
        })}
        <Route
          exact
          path="/"
          render={() => (<Redirect to="/extrance" />)}
        />
        <App>
          <Switch>
            {
              routes.map(({ path, models, ...dynamics }, key) => {
                const ix = key;
                models.forEach((modal) => {
                  if (modelNotExisted(app, modal)) {
                    app.model(import(`./models/${modal}`).default);
                  }
                });
                return (
                  <Route
                    key={ix}
                    exact
                    path={path}
                    component={dynamic({
                      app,
                      ...dynamics,
                    })}
                  />
                );
              })
            }
            <Route component={error} />
          </Switch>
        </App>
      </Switch>

    </ConnectedRouter>
  );
}

export default RouterConfig;
