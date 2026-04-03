package com.tribe.set.entity;

public enum Role {

    COLLECTOR(1),
    ADDITIONAL_DEPUTY_COLLECTOR(2),
    SDO(3),
    TEHSILDAR(4),
    BDO(5),
    TALATHI(6),
    GRAMSEVAK(7),
    SYSTEM_ADMINISTRATOR(99);

    private final int level;

    Role(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    public boolean canAssignTo(Role targetRole) {
        return this.level < targetRole.level;
    }

    public boolean canAllocateTask() {
        return this == COLLECTOR ||
               this == ADDITIONAL_DEPUTY_COLLECTOR ||
               this == SDO ||
               this == TEHSILDAR;
    }

    public boolean isFieldOfficer() {
        return this == BDO ||
               this == TALATHI ||
               this == GRAMSEVAK;
    }
}
