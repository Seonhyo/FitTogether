package com.fittogether.server.posts.controller;

import com.fittogether.server.posts.domain.dto.AddPostForm;
import com.fittogether.server.posts.domain.dto.PostDto;
import com.fittogether.server.posts.domain.dto.UpdatePostForm;
import com.fittogether.server.posts.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PostController {

  private final PostService postService;

  @PostMapping("/posts")
  public ResponseEntity<PostDto> createPost(/*@RequestHeader String token,*/
                                            @RequestBody AddPostForm addPostForm) {

    return ResponseEntity.ok(PostDto.from(
        postService.createPost(/*token,*/ addPostForm)));

  }
  @PutMapping("/posts/{postId}")
  public ResponseEntity<PostDto> updatePost(/*@RequestHeader String token,*/
                                            @PathVariable Long postId,
                                            @RequestBody UpdatePostForm updatePostForm) {
    return ResponseEntity.ok(PostDto.from(
        postService.updatePost(/*token,*/ postId, updatePostForm)));

  }
}
