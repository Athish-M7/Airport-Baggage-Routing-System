package com.vaanam.baggage.model;

/**
 * Passenger priority categories and declared rank (1 is highest priority).
 */
public enum PassengerCategory {
    FIRST(1),
    BUSINESS(2),
    FREQUENT_FLYER(3),
    ECONOMY(4);

    private final int rank;

    PassengerCategory(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }
}
