import { Diligencia } from './diligencia';
import { Status } from './status';

export interface DadosDiligencia {
    diligencias?: Diligencia[];
    listaStatus?: Status[];
}