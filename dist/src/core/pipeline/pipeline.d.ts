import { Stage } from './stages';
import { Document } from '../index';
export interface Pipeline {
    stages: Stage[];
}
export declare function executePipeline(pipeline: Pipeline, data: Document[]): Document[];
export declare function createPipeline(stages: Stage[]): Pipeline;
