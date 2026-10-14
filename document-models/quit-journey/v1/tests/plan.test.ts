import { generateMock } from "document-model/mock";
import {
  addMotivation,
  AddMotivationInputSchema,
  isQuitJourneyDocument,
  reducer,
  removeMotivation,
  RemoveMotivationInputSchema,
  setDisplayName,
  SetDisplayNameInputSchema,
  setQuitPlan,
  SetQuitPlanInputSchema,
  togglePrepTask,
  TogglePrepTaskInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("PlanOperations", () => {
  it("should handle setQuitPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetQuitPlanInputSchema(), {
      quitDateTime: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setQuitPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_QUIT_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setDisplayName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDisplayNameInputSchema());

    const updatedDocument = reducer(document, setDisplayName(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DISPLAY_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addMotivation operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddMotivationInputSchema(), {
      imageUrl: "https://example.com",
    });

    const updatedDocument = reducer(document, addMotivation(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_MOTIVATION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeMotivation operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveMotivationInputSchema());

    const updatedDocument = reducer(document, removeMotivation(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_MOTIVATION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle togglePrepTask operation", () => {
    const document = utils.createDocument();
    const input = generateMock(TogglePrepTaskInputSchema());

    const updatedDocument = reducer(document, togglePrepTask(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "TOGGLE_PREP_TASK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
