import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(username: string, password: string): Promise<User> {
    try {
      console.log('Creating user:', { username });
      const existingUser = await this.findOne(username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({
        username,
        password: hashedPassword,
      });
      const savedUser = await this.usersRepository.save(user);
      console.log('User saved:', savedUser);
      return savedUser;
    } catch (error) {
      console.error('Error in UsersService.create:', error);
      console.error('Error stack:', error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error creating user: ' + error.message,
      );
    }
  }
}
