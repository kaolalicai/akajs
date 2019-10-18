import 'reflect-metadata'
import {Service} from './IOC'
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

describe('Service auto load ', () => {
  let server

  @Service(Katana)
  class Katana implements Weapon {
    public hit () {
      return 'cut!'
    }
  }

  @Service(Shuriken)
  class Shuriken implements ThrowableWeapon {
    public throw () {
      return 'hit!'
    }
  }

  it(`Katana has bind`, () => {
    const kat = container.get<Katana>(Katana)
    expect(kat.hit()).eq('cut!')
  })

  it(`Shuriken has bind`, () => {
    const shuriken = container.get<Shuriken>(Shuriken)
    expect(shuriken.throw()).eq('hit!')
  })
})
