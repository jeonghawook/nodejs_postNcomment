"use strict";
const express = require("express");
const router = express.Router();
//const Post = require("../schemas/post");
//const Comment = require("../schemas/comment");
//const User = require("../schemas/user");
const { Post, User } = require("../models");

const authMiddleware = require("../middlewares/auth-middleware");
//////////////
//get  Post //
//////////////
router.get("/", async (req, res) => {
  try {
    const getPost = await Post.findAll({
      // attributes: [
      //   "postId",
      //   "userId",
      //   "nickname",
      //   "title",
      //   "createdAt",
      //   "updatedAt",
      // ],
      order: [["createdAt", "DESC"]],
    });

    if (getPost.length < 1) {
      return res.status(400).json({ message: "게시물이 아직 없습니다!" });
    }

    // const result = getPost.map((getpost) => {
    //   return {
    //     postId: getpost._id,
    //     userId: getpost.userId,
    //     nickname: getpost.nickname,
    //     title: getpost.title,
    //     createdAt: getpost.createdAt,
    //     updatedAt: getpost.updatedAt,
    //   };
    // });

    return res.status(200).json({ posts: getPost });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});
//////////////
//post Post //
//////////////
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { nickname, userId } = res.locals.user; //나는 미들에서 아에 하나만 뽑아옴

  if (!title || typeof title !== "string") {
    //params not available
    return res
      .status(412)
      .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
  }
  if (!content || typeof content !== "string") {
    //params not available
    return res
      .status(412)
      .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  try {
    const createPost = await Post.create({
      userId: userId,
      nickname,
      title,
      content,
    });

    return res.json({ message: "게시글을 생성하셨습니다." }); //Posts: createPost
  } catch (error) {
    //  if (err.name === "MongoServerError" && err.code === 11000) {

    // }
    return res.json({ message: "게시글 작성에 실패하였습니다." }); //Posts: createPost
  }
});
//////////////
//get PostId//
//////////////
router.get("/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const getPostDetails = await Post.findAll({ where: { postId: _postId } });
    if (!getPostDetails) {
      return res.status(404).json({ message: "게시글 조회에 실패하셨습니다" }); //try catch 에서 비슷한 시간에 걸리지 않을까요
    }
    // const result = {
    //   postId: getPostDetails._id,
    //   userId: getPostDetails.userId,
    //   nickname: getPostDetails.nickname,
    //   title: getPostDetails.title,
    //   content: getPostDetails.content,
    //   createdAt: getPostDetails.createdAt,
    //   updatedAt: getPostDetails.updatedAt,
    // };
    return res.json({ getPostDetails });
  } catch (err) {
    return res.status(400).json({
      message: "게시글 조회에 실패하셨습니다 / 데이터 형식이 올바르지 않습니다",
    });
  }
});
//////////////
//PUT PostId//
//////////////
router.put("/:_postId", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { title, content } = req.body;
  const { userId } = res.locals.user;

  if (!title || typeof title !== "string") {
    //params not available
    return res
      .status(412)
      .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
  }
  if (!content || typeof content !== "string") {
    //params not available
    return res
      .status(412)
      .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  try {
    const postDetail = await Post.findOne({ postId: _postId });
    if (!postDetail) {
      return res.status(404).json({ message: "게시글 조회에 실패하셨습니다" });
    }

    if (userId !== postDetail.userId) {
      //조건 추가 예정
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }
    console.log(postDetail.userId);
    const updatePost = await Post.update(
      { title: title, content: content },
      {
        where: {
          postId: postDetail.postId,
          userId: userId,
        },
      }
    );

    return res.json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    if (error.name === "MongoServerError") {
      return res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    }
    return res.status(400).json({ message: "게시글 수정에 실패하였습니다." });
  }
});

//////////////
//삭제PostId//
//////////////

router.delete("/:_postId", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { userId } = res.locals.user;

  try {
    const getPost = await Post.findOne({ postId: _postId });

    if (!getPost) {
      //null nan등등
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    if (userId !== getPost.userId) {
      return res.status(401).json({
        //수정 예정
        errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
      });
    }
    //게시글 + 댓글 삭제

    //

    //const findComment = await Comment.find({ postId: _postId });

    // if (!findComment) {
    //   const deletePost = await Post.deleteOne({ _id: _postId });
    //   return res.status(200).json({ message: "게시글을 삭제하셨습니다" });
    // }

    //const deleteComment = await Comment.deleteMany({ postId: _postId });
    const deletePost = await Post.destroy({ where: { postId: _postId } });
    return res.status(200).json({ message: "댓글 + 게시글을 삭제하셨습니다" });
  } catch (err) {
    if (err.name === "MongoServerError") {
      return res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
    }
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다2" });
  }
});

module.exports = router;
