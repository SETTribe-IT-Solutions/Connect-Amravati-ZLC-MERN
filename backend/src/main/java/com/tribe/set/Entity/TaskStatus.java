package com.tribe.set.Entity;

public enum TaskStatus {
	  PENDING,      // Task just created, not started
	    IN_PROGRESS,  // Field officer started working
	    COMPLETED,    // Field officer marked as done
	    OVERDUE       // System auto-sets this when due date passes

}
