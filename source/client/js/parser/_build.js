//  THIS MODULE IS INVOKED AT THE BUILD TIME. ANY ERRORS ARE REPORTED DURING THE GULP BUILD TASK  \\

import "./grammar";
import { getAutomatonTable, getRuleMappings as grm } from "./pushdownAutomaton";

/**
 * Returns automaton. Evaluated at compile time.
 * @returns {[[[*, *, *]]]} - [match, next, stack]
 */
export function getAutomaton () {
    return getAutomatonTable();
}

export function getRuleMappings () {
    return grm();
}