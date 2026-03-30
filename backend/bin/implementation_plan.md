# Task Allocation Module - Implementation Plan

The user has provided the Software Requirements Specification (SRS) for the Amravati Connect ZLC MERN project. The next functional requirement is to implement the **Task Allocation Module** (Section 3.4), with a specific, rigid hierarchical constraint:

> "Higher person can forward the task to lower but lower person cannot forward to higher one. Top most higher person is collector."

## 1. Role Hierarchy Definition
We need to establish a distinct hierarchy for the [Role](file:///e:/SETTribe/Amravati-Connect-ZLC-MERN/src/main/java/com/tribe/set/dto/RegisterRequest.java#35-38) enum so the system can programmatically determine who is higher or lower. 

### Proposed Hierarchy (from highest to lowest)
We will assign a numeric `level` (or use the enum `ordinal()`) to enforce this.
1. `COLLECTOR` (Highest)
2. `ADDITIONAL_DEPUTY_COLLECTOR`
3. `SDO`
4. `TEHSILDAR`
5. `BDO`
6. `TALATHI`
7. `GRAMSEVAK`
8. `SYSTEM_ADMINISTRATOR` (Special role, usually unrestricted, but for task allocation we will rank it below task-receivers unless specified otherwise by the user. I'll ask for clarification if needed, but for now I'll assign it to the bottom as it's an IT role, not an administrative one).

We'll add a method to the [Role](file:///e:/SETTribe/Amravati-Connect-ZLC-MERN/src/main/java/com/tribe/set/dto/RegisterRequest.java#35-38) enum: `boolean canAssignTo(Role targetRole)`. 

## 2. Task Entity
Create a [Task](file:///e:/SETTribe/Amravati-Connect-ZLC-MERN/src/main/java/com/tribe/set/Entity/Role.java#13-19) entity to store the allocated tasks.

### [NEW] Task.java
- `Long taskId` (Primary Key)
- `String title`
- `String description`
- `String priority` (HIGH, MEDIUM, LOW)
- `LocalDate dueDate`
- `String status` (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)
- `User assignedBy` (ManyToOne mapping)
- `User assignedTo` (ManyToOne mapping)
- `LocalDateTime createdAt`

## 3. Task DTOs
### [NEW] TaskRequest.java
Data transfer object to receive task creation requests.
- `String title`
- `String description`
- `String priority`
- `LocalDate dueDate`
- `Long assignedToUserId` // ID of the user receiving the task
- `Long assignedByUserId` // ID of the user creating the task

## 4. Task Repository
### [NEW] TaskRepository.java
Spring Data JPA repository for the [Task](file:///e:/SETTribe/Amravati-Connect-ZLC-MERN/src/main/java/com/tribe/set/Entity/Role.java#13-19) entity.

## 5. Task Service
### [NEW] TaskService.java
Will house the core business logic.
- `createTask(TaskRequest request)`: Will fetch the `assignedBy` and `assignedTo` users. It will then check `assignedBy.getRole().canAssignTo(assignedTo.getRole())`. If false, it will throw an `UnauthorizedTaskAllocationException`.

## 6. Task Controller
### [NEW] TaskController.java
REST endpoints mapping to `/api/tasks`.
- `POST /` : Create a new task.

## Verification
- We'll write a test (or use Postman) to ensure a `TEHSILDAR` cannot assign a task to a `COLLECTOR`, but a `COLLECTOR` can assign to a `TEHSILDAR`.
