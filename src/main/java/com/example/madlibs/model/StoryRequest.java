package com.example.madlibs.model;

public class StoryRequest {

    private String noun;
    private String verb;
    private String adjective;
    private String place;

    public String getNoun() {
        return noun;
    }
    public void setNoun(String noun){
        this.noun=noun;
    }

    public String getVerb() {
        return verb;
    }
    public void setVerb(String verb) {
        this.verb=verb;
    }
    public String getAdjective() {
        return adjective;
    }
    public void setAdjective(String adjective) {
        this.adjective = adjective;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }
}
