/**
 * @license
 * Copyright Netanel Basal. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NetanelBasal/spectator/blob/master/LICENSE
 */

import { Type, NgModule } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import * as customMatchers from './matchers';
import { Spectator } from './internals';
import { initialModule, SpectatorOptions } from './config';

/**
 * Create factory-function for tested component
 * @param typeOrOptions
 */
export function createTestComponentFactory<T>(typeOrOptions: SpectatorOptions<T> | Type<T>): (componentParameters?: Partial<T>, detectChanges?: boolean) => Spectator<T> {
  const { component, moduleMetadata } = initialModule<T>(typeOrOptions);

  beforeEach(() => {
    jasmine.addMatchers(customMatchers as any);
  });

  beforeEach(async(() => {
    @NgModule({
      entryComponents: [moduleMetadata.entryComponents ? moduleMetadata.entryComponents : []]
    })
    class EntryComponentModule {}

    moduleMetadata.imports = [moduleMetadata.imports ? moduleMetadata.imports : [], EntryComponentModule];
    TestBed.configureTestingModule(moduleMetadata)
      .overrideComponent(component, {
        set: {
          providers: moduleMetadata.componentProviders ? [moduleMetadata.componentProviders] : undefined
        }
      })
      .compileComponents();
  }));

  return (componentParameters: Partial<T> = {}, detectChanges = true) => {
    const spectator = new Spectator<T>();
    spectator.fixture = TestBed.createComponent(component);
    spectator.debugElement = spectator.fixture.debugElement;
    // The component instance
    spectator.component = spectator.debugElement.componentInstance;
    // The component native element
    spectator.element = spectator.debugElement.nativeElement;
    for (let p in componentParameters) {
      spectator.component[p] = componentParameters[p];
    }
    if (detectChanges) {
      spectator.detectChanges();
    }
    return spectator;
  };
}
