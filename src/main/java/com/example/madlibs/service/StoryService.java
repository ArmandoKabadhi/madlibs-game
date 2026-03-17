package com.example.madlibs.service;

import com.example.madlibs.model.StoryRequest;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class StoryService {

    private final Random random = new Random();

    public String generateStory(StoryRequest request) {
        String noun = safe(request.getNoun());
        String verb = safe(request.getVerb());
        String adjective = safe(request.getAdjective());
        String place = safe(request.getPlace());

        if (random.nextInt(10) == 0) {
            return "[EASTER_EGG] As you entered " + place + ", a " + adjective + " " + noun +
                    " appeared from the shadows. Its eyes did not blink. You tried to " + verb +
                    ", but something cold wrapped around your shoulder. The room went silent. " +
                    "Even the air felt wrong. The walls seemed alive, and for one long moment, " +
                    "it felt like the story was looking back at you.";
        }

        int story = random.nextInt(5);

        switch (story) {
            case 0:
                return "Yesterday I went to " + place + " and saw a " + adjective + " " + noun +
                        " that suddenly started to " + verb + ".";

            case 1:
                return "At the " + place + ", a " + adjective + " " + noun +
                        " decided to " + verb + " in front of everyone.";

            case 2:
                return "My friend and I found a " + adjective + " " + noun +
                        " in " + place + " that loves to " + verb + " every morning.";

            case 3:
                return "Nobody believed me when I said a " + adjective + " " + noun +
                        " was trying to " + verb + " at the " + place + ".";

            default:
                return "Legend says a " + adjective + " " + noun +
                        " lives in " + place + " and spends its time learning how to " + verb + ".";
        }
    }

    private String safe(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "mystery";
        }
        return value.trim();
    }
}