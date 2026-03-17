# User Role Implementation Details

## Overview
A new `Role` Enum has been introduced to the Amravati Connect ZLC MERN backend system. The purpose of this enum is to centralize the roles available in the system and enforce a clear distinction between administrative users (who can allocate tasks) and regular users.

## Role Breakdown

The `Role` enum defines the following roles:

### Admin Roles (Task Allocators)
The following roles are considered administrators and have the capability to allocate tasks:
- `COLLECTOR`
- `ADDITIONAL_DEPUTY_COLLECTOR`
- `SDO`
- `TEHSILDAR`

### User Roles
The following roles are regular users of the system (and system administrators):
- `BDO`
- `TALATHI`
- `GRAMSEVAK`
- `SYSTEM_ADMINISTRATOR`

## Capabilities
The `Role` enum contains a built-in helper method `canAllocateTask()`. This can be used globally across the Spring Boot backend to quickly determine if a given user has the underlying authority to allocate tasks to others. 

```java
// Example usage:
if (user.getRole().canAllocateTask()) {
    // proceed with task allocation
} else {
    // throw unauthorized exception
}
```

## Relevant Code Changes

1. **`Role.java` Enum Created:** 
   Located in `com.tribe.set.Entity`.

2. **`User.java` Entity Updated:**
   The `role` property in the `User` entity has been changed from a `String` to the `Role` enum, utilizing `@Enumerated(EnumType.STRING)` to ensure persistence works cohesively with the existing database.

3. **`AuthService.java` Updated:**
   The `login` method was updated to be compatible with the new Enum format. It uses `user.getRole().name()` when returning the `LoginResponse`.
