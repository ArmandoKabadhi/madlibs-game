package com.example.madlibs.controller;

import com.example.madlibs.model.StoryRequest;
import com.example.madlibs.service.StoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/story")
@CrossOrigin
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping
    public String createStory(@RequestBody StoryRequest request) {
        return storyService.generateStory(request);
    }
}