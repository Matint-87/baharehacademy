export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "شناسه دوره ارسال نشده" }, { status: 400 });
  }
  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ success: false, error: "دوره پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}