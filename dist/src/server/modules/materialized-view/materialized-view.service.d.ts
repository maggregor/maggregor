import { MaterializedView } from './materialized-view.schema';
import { Model } from 'mongoose';
export declare class MaterializedViewService {
    private readonly materializedViewModel;
    constructor(materializedViewModel: Model<MaterializedView>);
    create(request: MaterializedView): Promise<MaterializedView>;
    findAll(): Promise<MaterializedView[]>;
    findOne(id: string): Promise<MaterializedView>;
    update(id: string, request: MaterializedView): Promise<MaterializedView>;
    delete(id: string): Promise<MaterializedView>;
}
