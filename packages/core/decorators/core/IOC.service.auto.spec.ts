import 'reflect-metadata'
import {Service, Autowired} from './IOC'
import {expect} from 'chai'
import {container} from '../../cantainer'

export interface Warrior {
  fight (): string

  sneak (): string
}

export interface Weapon {
  hit (): string
}

export interface ThrowableWeapon {
  throw (): string
}

describe('IOC.service.auto.spec', () => {

  @Service()
  class Katana implements Weapon {
    public hit () {
      return 'cut!'
    }
  }

  @Service()
  class Shuriken implements ThrowableWeapon {
    public throw () {
      return 'hit!'
    }
  }

  it(`Katana and Shuriken has bind`, () => {
    @Service()
    class Ninja implements Warrior {
      @Autowired()
      private _katana: Weapon
      @Autowired()
      private _shuriken: ThrowableWeapon

      public fight () {
        return this._katana.hit()
      }

      public sneak () {
        return this._shuriken.throw()
      }
    }

    const ninja = container.get<Ninja>('Ninja')
    expect(ninja.fight()).eq('cut!')
    expect(ninja.sneak()).eq('hit!')
  })

  it(`Autowired constructor parameters fail`, () => {
    expect(() => {
      @Service()
      class NinjaC {
        private _katanabb: Weapon

        constructor (@Autowired() katan: Weapon) {
          this._katanabb = katan
        }

        public fight () {
          return this._katanabb.hit()
        }
      }

      const ninja = container.get<NinjaC>('NinjaC')
      ninja.fight()
    }).to.throw('不支持注入到参数中')
  })

  it(`Autowired key fail`, () => {
    expect(() => {
      @Service()
      class NinjaB {
        @Autowired()
        private _katanabb: Weapon

        public fight () {
          return this._katanabb.hit()
        }
      }

      const ninja = container.get<NinjaB>('NinjaB')
      ninja.fight()
    }).to.throw('找不到能够注入的对象')
  })
})
