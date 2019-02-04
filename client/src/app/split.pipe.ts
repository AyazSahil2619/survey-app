import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'split'
})
export class SplitPipe implements PipeTransform {
    transform(val: string, params: string[]): string[] {
        console.log(val.split(params[0]), "IN PIPE");
        return val.split(params[0]);
    }
}