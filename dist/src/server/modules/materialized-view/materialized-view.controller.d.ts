import { MaterializedView } from './materialized-view.schema';
import { MaterializedViewService } from './materialized-view.service';
export declare class MaterializedViewController {
    private readonly requestService;
    constructor(requestService: MaterializedViewService);
    create(request: MaterializedView): Promise<MaterializedView>;
    findAll(): Promise<MaterializedView[]>;
    findOne(id: string): Promise<MaterializedView>;
    update(id: string, request: MaterializedView): Promise<MaterializedView>;
    delete(id: string): Promise<MaterializedView>;
}
