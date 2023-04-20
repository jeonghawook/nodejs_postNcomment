"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "UserId", // 4. Comments 모델의 UserId 컬럼과 연결합니다.
      });

      this.belongsTo(models.Post, {
        // 2. Posts 모델에게 N:1 관계 설정을 합니다.
        targetKey: "postId", // 3. Posts 모델의 postId 컬럼을
        foreignKey: "PostId", // 4. Comments 모델의 PostId 컬럼과 연결합니다.
      });
    }
  }
  Comment.init(
    {
      commentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      postId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      nickname: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      comment: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
