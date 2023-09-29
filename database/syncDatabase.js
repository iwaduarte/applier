import { sequelize }  from "./connect.js"

// update database tables (columns and metadata).
// quick alternative to migrations.

sequelize
  .sync({
    alter: true,
    logging: true
  })
  .then(status => {
    if (status) console.dir(status.models, { depth: 0 });
  })
  .catch(error => console.log(error));
