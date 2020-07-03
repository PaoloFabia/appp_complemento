module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('event', {
    name: DataTypes.STRING,
    organizer: DataTypes.STRING,
    date: DataTypes.STRING,
    place: DataTypes.STRING,
    category: DataTypes.STRING,
    banner: DataTypes.STRING,
  }, {});

  event.associate = function associate() {
    // associations can be defined here. This method receives a models parameter.
  };

  return event;
};
