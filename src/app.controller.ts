import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  Prisma,
  User as UserModel,
  Book as BookModel,
  Profile,
} from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('book/:id')
  async getBookById(@Param('id') id: string): Promise<BookModel> {
    return this.prismaService.book.findUnique({
      where: {
        id: Number(id),
      },
    });
  }

  @Get('dashboard')
  async getFilteredBook(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ): Promise<BookModel[]> {
    const or = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {};

    return this.prismaService.book.findMany({
      where: {
        ...or,
      },
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    });
  }

  @Get('users')
  async getAllUser(): Promise<UserModel[]> {
    return this.prismaService.user.findMany();
  }

  @Get('user/:id/drafts')
  async getDraftsByUser(@Param('id') id: string): Promise<BookModel[]> {
    return this.prismaService.user
      .findUnique({
        where: { id: Number(id) },
      })
      .books({
        where: {
          published: false,
        },
      });
  }

  @Post('post')
  async createDraft(
    @Body()
    bookData: {
      title: string;
      page: number;
      description?: string;
      authorId: null;
    },
  ): Promise<BookModel> {
    const { title, page, description, authorId } = bookData;
    return this.prismaService.book.create({
      data: {
        title,
        page,
        description,
        author: {
          connect: { id: authorId },
        },
      },
    });
  }

  @Post('sign-up')
  async signUpUser(
    @Body()
    userData: {
      username: string;
      password: string;
      email: string;
      books?: Prisma.BookCreateInput[];
    },
  ): Promise<UserModel> {
    const bookData = userData.books?.map((book) => {
      return {
        title: book?.title,
        page: book?.page,
        description: book?.description,
      };
    });
    return this.prismaService.user.create({
      data: {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        books: {
          create: bookData,
        },
      },
    });
  }

  @Put('publish/:id')
  async togglePublishBook(@Param('id') id: string): Promise<BookModel> {
    const bookData = await this.prismaService.book.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        published: true,
      },
    });

    return this.prismaService.book.update({
      where: { id: Number(id) || undefined },
      data: { published: !bookData?.published },
    });
  }

  @Delete('book/:id')
  async deleteBook(@Param('id') id: string): Promise<BookModel> {
    return this.prismaService.book.delete({
      where: { id: Number(id) },
    });
  }

  @Put('book/:id/views')
  async incrementBookCount(@Param('id') id: string): Promise<BookModel> {
    return this.prismaService.book.update({
      where: {
        id: Number(id),
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  @Post('user/:id/profile')
  async createUserProfile(
    @Param('id') id: string,
    @Body() userBio: { bio: string },
  ): Promise<Profile> {
    return this.prismaService.profile.create({
      data: {
        bio: userBio.bio,
        user: {
          connect: {
            id: Number(id),
          },
        },
      },
    });
  }
}
