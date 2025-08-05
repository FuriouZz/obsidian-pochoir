import type { FuzzyMatch } from "obsidian";
import type {
    TemplateModalEntry,
    TemplateModalSuggester,
} from "./suggesters/template-modal-suggester";

export interface TemplateSuggester {
    getItems?: (params: {
        suggester: TemplateModalSuggester;
        items: TemplateModalEntry[];
    }) => TemplateModalEntry[];
    getSuggestions?: (params: {
        suggester: TemplateModalSuggester;
        query: string;
    }) => FuzzyMatch<TemplateModalEntry>[] | undefined | null;
}

export class TemplateSuggesterSet extends Set<TemplateSuggester> {}
