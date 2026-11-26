import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_border(cell, **kwargs):
    """
    Set cell borders
    kwargs: top, bottom, left, right
    values: dict(sz=12, val='single', color='CBD5E1', space='0')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = 'w:{}'.format(edge)
            element = tcBorders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tcBorders.append(element)
            for key, attr in [("val", "w:val"), ("color", "w:color"), ("sz", "w:sz"), ("space", "w:space")]:
                if key in edge_data:
                    element.set(qn(attr), str(edge_data[key]))

def set_cell_shading(cell, color_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def create_report():
    doc = Document()
    
    # Page setup - A4 with 0.5 in margins
    for section in doc.sections:
        section.page_width = Inches(8.27)   # A4 width
        section.page_height = Inches(11.69) # A4 height
        section.top_margin = Inches(0.45)
        section.bottom_margin = Inches(0.45)
        section.left_margin = Inches(0.55)
        section.right_margin = Inches(0.55)
        
        # Add footer
        footer = section.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run("College Admission Management System • B.Tech CSE Project")
        f_run.font.name = "Segoe UI"
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = RGBColor(100, 116, 139)

    content_width = Inches(7.17)
    screen_dir = os.path.join(os.path.dirname(__file__), 'docs', 'screenshots')

    # Base styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Segoe UI'
    style_normal.font.size = Pt(9.5)
    style_normal.font.color.rgb = RGBColor(30, 41, 59)

    # -------------------------------------------------------------
    # PAGE 1: PROJECT OVERVIEW & HOME INTERFACE
    # -------------------------------------------------------------
    
    # Header block
    h_table = doc.add_table(rows=1, cols=2)
    h_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_table.autofit = False
    h_table.columns[0].width = Inches(5.0)
    h_table.columns[1].width = Inches(2.17)
    
    cell_l = h_table.cell(0, 0)
    p_title = cell_l.paragraphs[0]
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(1)
    run_t = p_title.add_run("College Admission Management System")
    run_t.bold = True
    run_t.font.size = Pt(15)
    run_t.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub = cell_l.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(2)
    run_sub = p_sub.add_run("Relational Database Management System (RDBMS) Course Project")
    run_sub.bold = True
    run_sub.font.size = Pt(9.5)
    run_sub.font.color.rgb = RGBColor(2, 132, 199)
    
    cell_r = h_table.cell(0, 1)
    p_r = cell_r.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_r.paragraph_format.space_before = Pt(0)
    p_r.paragraph_format.space_after = Pt(1)
    run_r1 = p_r.add_run("B.Tech Computer Science & Engg.\n")
    run_r1.font.size = Pt(8.5)
    run_r1.font.color.rgb = RGBColor(100, 116, 139)
    run_r2 = p_r.add_run("Academic Project Report")
    run_r2.bold = True
    run_r2.font.size = Pt(8.5)
    run_r2.font.color.rgb = RGBColor(15, 23, 42)
    
    # Border under header
    set_cell_border(cell_l, bottom=dict(sz=12, val='single', color='0284C7'))
    set_cell_border(cell_r, bottom=dict(sz=12, val='single', color='0284C7'))

    # Brief intro
    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_before = Pt(6)
    p_intro.paragraph_format.space_after = Pt(5)
    run_intro = p_intro.add_run(
        "A full-stack web application designed to manage university admissions digitally. "
        "It replaces manual paperwork with an online workflow where students can view programs, submit applications "
        "with certificates, and track admission status, while university staff verify credentials, allocate category quota seats, "
        "and confirm fee payments."
    )
    run_intro.font.size = Pt(9)
    run_intro.font.color.rgb = RGBColor(51, 65, 85)

    # 3-Column Quick Highlights
    t_info = doc.add_table(rows=1, cols=3)
    t_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_info.autofit = False
    col_w = Inches(2.35)
    for c in t_info.columns:
        c.width = col_w

    c_titles = ["DATABASE DESIGN", "TECHNOLOGIES USED", "USER ROLES"]
    c_texts = [
        "MySQL 8.0 with 14 normalized tables (3NF). Uses prisma.$transaction and optimistic locking (version counter) to prevent seat over-allocation.",
        "Frontend: Next.js 14, React 18, Tailwind CSS.\nBackend: NestJS 10, Prisma ORM 5.22, JWT, bcrypt, and Redis for OTP rate limits.",
        "Role-based access for 6 roles: Applicant (apply & pay), Officer/HOD (verify), Accounts (fees), and Admin/Auditor (quotas & logs)."
    ]

    for i in range(3):
        cell = t_info.cell(0, i)
        set_cell_shading(cell, "F8FAFC")
        set_cell_border(cell, 
            top=dict(sz=4, val='single', color='CBD5E1'),
            bottom=dict(sz=4, val='single', color='CBD5E1'),
            left=dict(sz=4, val='single', color='CBD5E1'),
            right=dict(sz=4, val='single', color='CBD5E1')
        )
        p1 = cell.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r_t = p1.add_run(c_titles[i] + "\n")
        r_t.bold = True
        r_t.font.size = Pt(8.5)
        r_t.font.color.rgb = RGBColor(3, 105, 161)
        
        r_b = p1.add_run(c_texts[i])
        r_b.font.size = Pt(8)
        r_b.font.color.rgb = RGBColor(71, 85, 105)

    # Spacer
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(0)

    # Figure 1: Large Home Page Screenshot
    t_fig1 = doc.add_table(rows=3, cols=1)
    t_fig1.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig1.autofit = False
    t_fig1.columns[0].width = content_width

    # Figure Title Bar
    c_title = t_fig1.cell(0, 0)
    set_cell_shading(c_title, "F8FAFC")
    set_cell_border(c_title, 
        top=dict(sz=4, val='single', color='CBD5E1'),
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='E2E8F0')
    )
    p_f1_t = c_title.paragraphs[0]
    p_f1_t.paragraph_format.space_before = Pt(3)
    p_f1_t.paragraph_format.space_after = Pt(3)
    r_f1 = p_f1_t.add_run("Figure 1: University Admissions Portal (Home Page)  ")
    r_f1.bold = True
    r_f1.font.size = Pt(9.5)
    r_f1.font.color.rgb = RGBColor(15, 23, 42)
    r_url = p_f1_t.add_run("http://localhost:3000/")
    r_url.font.name = "Consolas"
    r_url.font.size = Pt(8.5)
    r_url.font.color.rgb = RGBColor(100, 116, 139)

    # Image Cell
    c_img = t_fig1.cell(1, 0)
    set_cell_border(c_img, 
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='E2E8F0')
    )
    p_img1 = c_img.paragraphs[0]
    p_img1.paragraph_format.space_before = Pt(0)
    p_img1.paragraph_format.space_after = Pt(0)
    p_img1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img1_path = os.path.join(screen_dir, 'frontend_landing.png')
    p_img1.add_run().add_picture(img1_path, width=Inches(7.1))

    # Caption Cell
    c_cap = t_fig1.cell(2, 0)
    set_cell_border(c_cap, 
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='CBD5E1')
    )
    p_cap1 = c_cap.paragraphs[0]
    p_cap1.paragraph_format.space_before = Pt(3)
    p_cap1.paragraph_format.space_after = Pt(3)
    r_c1 = p_cap1.add_run("Overview: ")
    r_c1.bold = True
    r_c1.font.size = Pt(8.5)
    r_c2 = p_cap1.add_run("The public admissions landing page outlining the 4-step admission process, active course statistics, and navigation links for applicant registration and login.")
    r_c2.font.size = Pt(8.5)
    r_c2.font.color.rgb = RGBColor(71, 85, 105)

    # End Page 1
    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 2: FRONTEND USER INTERFACES
    # -------------------------------------------------------------
    h2_table = doc.add_table(rows=1, cols=2)
    h2_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h2_table.autofit = False
    h2_table.columns[0].width = Inches(5.0)
    h2_table.columns[1].width = Inches(2.17)
    
    cell_l2 = h2_table.cell(0, 0)
    p_t2 = cell_l2.paragraphs[0]
    p_t2.paragraph_format.space_before = Pt(0)
    p_t2.paragraph_format.space_after = Pt(1)
    r_t2 = p_t2.add_run("Frontend User Interfaces")
    r_t2.bold = True
    r_t2.font.size = Pt(15)
    r_t2.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub2 = cell_l2.add_paragraph()
    p_sub2.paragraph_format.space_before = Pt(0)
    p_sub2.paragraph_format.space_after = Pt(2)
    r_sub2 = p_sub2.add_run("Student Admissions Portal & Applicant Workflows (Next.js 14)")
    r_sub2.bold = True
    r_sub2.font.size = Pt(9.5)
    r_sub2.font.color.rgb = RGBColor(2, 132, 199)
    
    cell_r2 = h2_table.cell(0, 1)
    p_r2 = cell_r2.paragraphs[0]
    p_r2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_r2.paragraph_format.space_before = Pt(0)
    p_r2.paragraph_format.space_after = Pt(1)
    r_r2_1 = p_r2.add_run("Client Application\n")
    r_r2_1.font.size = Pt(8.5)
    r_r2_1.font.color.rgb = RGBColor(100, 116, 139)
    r_r2_2 = p_r2.add_run("Next.js 14 & Tailwind CSS")
    r_r2_2.bold = True
    r_r2_2.font.size = Pt(8.5)
    r_r2_2.font.color.rgb = RGBColor(15, 23, 42)
    
    set_cell_border(cell_l2, bottom=dict(sz=12, val='single', color='0284C7'))
    set_cell_border(cell_r2, bottom=dict(sz=12, val='single', color='0284C7'))

    p_sp2 = doc.add_paragraph()
    p_sp2.paragraph_format.space_before = Pt(5)
    p_sp2.paragraph_format.space_after = Pt(0)

    # Figure 2: Programs Catalog (Full Width)
    t_fig2 = doc.add_table(rows=3, cols=1)
    t_fig2.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig2.autofit = False
    t_fig2.columns[0].width = content_width

    c_t2 = t_fig2.cell(0, 0)
    set_cell_shading(c_t2, "F8FAFC")
    set_cell_border(c_t2, 
        top=dict(sz=4, val='single', color='CBD5E1'),
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='E2E8F0')
    )
    p_f2_t = c_t2.paragraphs[0]
    p_f2_t.paragraph_format.space_before = Pt(3)
    p_f2_t.paragraph_format.space_after = Pt(3)
    r_f2 = p_f2_t.add_run("Figure 2: Academic Programs and Seat Matrix Catalog  ")
    r_f2.bold = True
    r_f2.font.size = Pt(9.5)
    r_url2 = p_f2_t.add_run("http://localhost:3000/programs")
    r_url2.font.name = "Consolas"
    r_url2.font.size = Pt(8.5)
    r_url2.font.color.rgb = RGBColor(100, 116, 139)

    c_img2 = t_fig2.cell(1, 0)
    set_cell_border(c_img2, 
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='E2E8F0')
    )
    p_img2 = c_img2.paragraphs[0]
    p_img2.paragraph_format.space_before = Pt(0)
    p_img2.paragraph_format.space_after = Pt(0)
    p_img2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img2_path = os.path.join(screen_dir, 'frontend_programs.png')
    p_img2.add_run().add_picture(img2_path, width=Inches(7.1))

    c_cap2 = t_fig2.cell(2, 0)
    set_cell_border(c_cap2, 
        left=dict(sz=4, val='single', color='CBD5E1'),
        right=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='CBD5E1')
    )
    p_cap2 = c_cap2.paragraphs[0]
    p_cap2.paragraph_format.space_before = Pt(3)
    p_cap2.paragraph_format.space_after = Pt(3)
    r_c2_1 = p_cap2.add_run("Description: ")
    r_c2_1.bold = True
    r_c2_1.font.size = Pt(8.5)
    r_c2_2 = p_cap2.add_run("Course directory showing undergraduate and postgraduate degrees (B.Tech CSE, BCA, B.Pharm, MCA, MBA) with eligibility criteria, tuition fees, and category-wise seat quotas.")
    r_c2_2.font.size = Pt(8.5)
    r_c2_2.font.color.rgb = RGBColor(71, 85, 105)

    p_sp3 = doc.add_paragraph()
    p_sp3.paragraph_format.space_before = Pt(5)
    p_sp3.paragraph_format.space_after = Pt(0)

    # Figures 3 & 4: Registration & Login Side-by-Side
    t_split = doc.add_table(rows=1, cols=2)
    t_split.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_split.autofit = False
    half_w = Inches(3.52)
    t_split.columns[0].width = half_w
    t_split.columns[1].width = half_w

    # Sub-table for Figure 3
    c_split_l = t_split.cell(0, 0)
    t_f3 = c_split_l.add_table(rows=3, cols=1)
    t_f3.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_f3.autofit = False
    t_f3.columns[0].width = Inches(3.45)

    c3_t = t_f3.cell(0, 0)
    set_cell_shading(c3_t, "F8FAFC")
    set_cell_border(c3_t, top=dict(sz=4, val='single', color='CBD5E1'), left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p3_t = c3_t.paragraphs[0]
    p3_t.paragraph_format.space_before = Pt(2)
    p3_t.paragraph_format.space_after = Pt(2)
    r3_t = p3_t.add_run("Figure 3: Applicant Registration\n")
    r3_t.bold = True
    r3_t.font.size = Pt(9)
    r3_u = p3_t.add_run("/register")
    r3_u.font.name = "Consolas"
    r3_u.font.size = Pt(8)
    r3_u.font.color.rgb = RGBColor(100, 116, 139)

    c3_img = t_f3.cell(1, 0)
    set_cell_border(c3_img, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p3_img = c3_img.paragraphs[0]
    p3_img.paragraph_format.space_before = Pt(0)
    p3_img.paragraph_format.space_after = Pt(0)
    p3_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img3_path = os.path.join(screen_dir, 'frontend_register.png')
    p3_img.add_run().add_picture(img3_path, width=Inches(3.38))

    c3_cap = t_f3.cell(2, 0)
    set_cell_border(c3_cap, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='CBD5E1'))
    p3_c = c3_cap.paragraphs[0]
    p3_c.paragraph_format.space_before = Pt(2)
    p3_c.paragraph_format.space_after = Pt(2)
    r3_d = p3_c.add_run("Description: Student registration collecting applicant profile and reservation category.")
    r3_d.font.size = Pt(8)
    r3_d.font.color.rgb = RGBColor(71, 85, 105)

    # Sub-table for Figure 4
    c_split_r = t_split.cell(0, 1)
    t_f4 = c_split_r.add_table(rows=3, cols=1)
    t_f4.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_f4.autofit = False
    t_f4.columns[0].width = Inches(3.45)

    c4_t = t_f4.cell(0, 0)
    set_cell_shading(c4_t, "F8FAFC")
    set_cell_border(c4_t, top=dict(sz=4, val='single', color='CBD5E1'), left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p4_t = c4_t.paragraphs[0]
    p4_t.paragraph_format.space_before = Pt(2)
    p4_t.paragraph_format.space_after = Pt(2)
    r4_t = p4_t.add_run("Figure 4: User Sign-In Portal\n")
    r4_t.bold = True
    r4_t.font.size = Pt(9)
    r4_u = p4_t.add_run("/login")
    r4_u.font.name = "Consolas"
    r4_u.font.size = Pt(8)
    r4_u.font.color.rgb = RGBColor(100, 116, 139)

    c4_img = t_f4.cell(1, 0)
    set_cell_border(c4_img, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p4_img = c4_img.paragraphs[0]
    p4_img.paragraph_format.space_before = Pt(0)
    p4_img.paragraph_format.space_after = Pt(0)
    p4_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img4_path = os.path.join(screen_dir, 'frontend_login.png')
    p4_img.add_run().add_picture(img4_path, width=Inches(3.38))

    c4_cap = t_f4.cell(2, 0)
    set_cell_border(c4_cap, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='CBD5E1'))
    p4_c = c4_cap.paragraphs[0]
    p4_c.paragraph_format.space_before = Pt(2)
    p4_c.paragraph_format.space_after = Pt(2)
    r4_d = p4_c.add_run("Description: Login screen verifying bcrypt password hashes and returning JWT tokens.")
    r4_d.font.size = Pt(8)
    r4_d.font.color.rgb = RGBColor(71, 85, 105)

    # End Page 2
    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 3: BACKEND SERVICES & DATABASE MANAGEMENT
    # -------------------------------------------------------------
    h3_table = doc.add_table(rows=1, cols=2)
    h3_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h3_table.autofit = False
    h3_table.columns[0].width = Inches(5.0)
    h3_table.columns[1].width = Inches(2.17)
    
    cell_l3 = h3_table.cell(0, 0)
    p_t3 = cell_l3.paragraphs[0]
    p_t3.paragraph_format.space_before = Pt(0)
    p_t3.paragraph_format.space_after = Pt(1)
    r_t3 = p_t3.add_run("Backend Services & Database")
    r_t3.bold = True
    r_t3.font.size = Pt(15)
    r_t3.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub3 = cell_l3.add_paragraph()
    p_sub3.paragraph_format.space_before = Pt(0)
    p_sub3.paragraph_format.space_after = Pt(2)
    r_sub3 = p_sub3.add_run("NestJS REST API • MySQL 8.0 • Prisma ORM")
    r_sub3.bold = True
    r_sub3.font.size = Pt(9.5)
    r_sub3.font.color.rgb = RGBColor(2, 132, 199)
    
    cell_r3 = h3_table.cell(0, 1)
    p_r3 = cell_r3.paragraphs[0]
    p_r3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_r3.paragraph_format.space_before = Pt(0)
    p_r3.paragraph_format.space_after = Pt(1)
    r_r3_1 = p_r3.add_run("Server & Database Tier\n")
    r_r3_1.font.size = Pt(8.5)
    r_r3_1.font.color.rgb = RGBColor(100, 116, 139)
    r_r3_2 = p_r3.add_run("Backend Architecture")
    r_r3_2.bold = True
    r_r3_2.font.size = Pt(8.5)
    r_r3_2.font.color.rgb = RGBColor(15, 23, 42)
    
    set_cell_border(cell_l3, bottom=dict(sz=12, val='single', color='0284C7'))
    set_cell_border(cell_r3, bottom=dict(sz=12, val='single', color='0284C7'))

    p_sp4 = doc.add_paragraph()
    p_sp4.paragraph_format.space_before = Pt(4)
    p_sp4.paragraph_format.space_after = Pt(0)

    # Figure 5: Swagger UI
    t_fig5 = doc.add_table(rows=3, cols=1)
    t_fig5.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig5.autofit = False
    t_fig5.columns[0].width = content_width

    c5_t = t_fig5.cell(0, 0)
    set_cell_shading(c5_t, "F8FAFC")
    set_cell_border(c5_t, top=dict(sz=4, val='single', color='CBD5E1'), left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p5_t = c5_t.paragraphs[0]
    p5_t.paragraph_format.space_before = Pt(2)
    p5_t.paragraph_format.space_after = Pt(2)
    r5_t = p5_t.add_run("Figure 5: REST API Documentation (OpenAPI / Swagger 3.0)  ")
    r5_t.bold = True
    r5_t.font.size = Pt(9.5)
    r5_u = p5_t.add_run("http://localhost:4000/api/docs")
    r5_u.font.name = "Consolas"
    r5_u.font.size = Pt(8.5)
    r5_u.font.color.rgb = RGBColor(100, 116, 139)

    c5_img = t_fig5.cell(1, 0)
    set_cell_border(c5_img, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p5_img = c5_img.paragraphs[0]
    p5_img.paragraph_format.space_before = Pt(0)
    p5_img.paragraph_format.space_after = Pt(0)
    p5_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img5_path = os.path.join(screen_dir, 'backend_swagger.png')
    p5_img.add_run().add_picture(img5_path, width=Inches(7.1))

    c5_cap = t_fig5.cell(2, 0)
    set_cell_border(c5_cap, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='CBD5E1'))
    p5_cap = c5_cap.paragraphs[0]
    p5_cap.paragraph_format.space_before = Pt(2)
    p5_cap.paragraph_format.space_after = Pt(2)
    r5_c1 = p5_cap.add_run("Description: ")
    r5_c1.bold = True
    r5_c1.font.size = Pt(8.5)
    r5_c2 = p5_cap.add_run("Interactive Swagger UI documenting backend endpoints for authentication, academic programs, seat quotas, and applications.")
    r5_c2.font.size = Pt(8.5)
    r5_c2.font.color.rgb = RGBColor(71, 85, 105)

    p_sp5 = doc.add_paragraph()
    p_sp5.paragraph_format.space_before = Pt(4)
    p_sp5.paragraph_format.space_after = Pt(0)

    # Figure 6: MySQL Database Schema
    t_fig6 = doc.add_table(rows=3, cols=1)
    t_fig6.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig6.autofit = False
    t_fig6.columns[0].width = content_width

    c6_t = t_fig6.cell(0, 0)
    set_cell_shading(c6_t, "F8FAFC")
    set_cell_border(c6_t, top=dict(sz=4, val='single', color='CBD5E1'), left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p6_t = c6_t.paragraphs[0]
    p6_t.paragraph_format.space_before = Pt(2)
    p6_t.paragraph_format.space_after = Pt(2)
    r6_t = p6_t.add_run("Figure 6: MySQL Database Tables & Sample Data  ")
    r6_t.bold = True
    r6_t.font.size = Pt(9.5)
    r6_u = p6_t.add_run("Database: admission_db (MySQL 8.0)")
    r6_u.font.name = "Consolas"
    r6_u.font.size = Pt(8.5)
    r6_u.font.color.rgb = RGBColor(100, 116, 139)

    c6_img = t_fig6.cell(1, 0)
    set_cell_border(c6_img, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p6_img = c6_img.paragraphs[0]
    p6_img.paragraph_format.space_before = Pt(0)
    p6_img.paragraph_format.space_after = Pt(0)
    p6_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img6_path = os.path.join(screen_dir, 'backend_database_schema.png')
    p6_img.add_run().add_picture(img6_path, width=Inches(7.1))

    c6_cap = t_fig6.cell(2, 0)
    set_cell_border(c6_cap, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='CBD5E1'))
    p6_cap = c6_cap.paragraphs[0]
    p6_cap.paragraph_format.space_before = Pt(2)
    p6_cap.paragraph_format.space_after = Pt(2)
    r6_c1 = p6_cap.add_run("Description: ")
    r6_c1.bold = True
    r6_c1.font.size = Pt(8.5)
    r6_c2 = p6_cap.add_run("MySQL relational tables managed via Prisma ORM showing courses, seat quotas with optimistic locking version counters, and user accounts.")
    r6_c2.font.size = Pt(8.5)
    r6_c2.font.color.rgb = RGBColor(71, 85, 105)

    p_sp6 = doc.add_paragraph()
    p_sp6.paragraph_format.space_before = Pt(4)
    p_sp6.paragraph_format.space_after = Pt(0)

    # Bottom Split: Figure 7 + Project Summary
    t_bot = doc.add_table(rows=1, cols=2)
    t_bot.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_bot.autofit = False
    t_bot.columns[0].width = Inches(3.52)
    t_bot.columns[1].width = Inches(3.52)

    # Left: Figure 7 (API Root)
    c_b_l = t_bot.cell(0, 0)
    t_f7 = c_b_l.add_table(rows=3, cols=1)
    t_f7.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_f7.autofit = False
    t_f7.columns[0].width = Inches(3.45)

    c7_t = t_f7.cell(0, 0)
    set_cell_shading(c7_t, "F8FAFC")
    set_cell_border(c7_t, top=dict(sz=4, val='single', color='CBD5E1'), left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p7_t = c7_t.paragraphs[0]
    p7_t.paragraph_format.space_before = Pt(1)
    p7_t.paragraph_format.space_after = Pt(1)
    r7_t = p7_t.add_run("Figure 7: API Health Response  ")
    r7_t.bold = True
    r7_t.font.size = Pt(8.5)
    r7_u = p7_t.add_run("http://localhost:4000/")
    r7_u.font.name = "Consolas"
    r7_u.font.size = Pt(7.5)
    r7_u.font.color.rgb = RGBColor(100, 116, 139)

    c7_img = t_f7.cell(1, 0)
    set_cell_border(c7_img, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='E2E8F0'))
    p7_img = c7_img.paragraphs[0]
    p7_img.paragraph_format.space_before = Pt(0)
    p7_img.paragraph_format.space_after = Pt(0)
    p7_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img7_path = os.path.join(screen_dir, 'backend_api_response.png')
    p7_img.add_run().add_picture(img7_path, width=Inches(3.38))

    c7_cap = t_f7.cell(2, 0)
    set_cell_border(c7_cap, left=dict(sz=4, val='single', color='CBD5E1'), right=dict(sz=4, val='single', color='CBD5E1'), bottom=dict(sz=4, val='single', color='CBD5E1'))
    p7_c = c7_cap.paragraphs[0]
    p7_c.paragraph_format.space_before = Pt(1)
    p7_c.paragraph_format.space_after = Pt(1)
    r7_d = p7_c.add_run("Description: JSON endpoint reporting server uptime and documentation paths.")
    r7_d.font.size = Pt(7.5)
    r7_d.font.color.rgb = RGBColor(71, 85, 105)

    # Right: Project Summary Box
    c_b_r = t_bot.cell(0, 1)
    set_cell_shading(c_b_r, "F8FAFC")
    set_cell_border(c_b_r, 
        top=dict(sz=4, val='single', color='CBD5E1'),
        bottom=dict(sz=4, val='single', color='CBD5E1'),
        left=dict(sz=8, val='single', color='0284C7'),
        right=dict(sz=4, val='single', color='CBD5E1')
    )
    p_sum = c_b_r.paragraphs[0]
    p_sum.paragraph_format.space_before = Pt(4)
    p_sum.paragraph_format.space_after = Pt(2)
    r_sum_t = p_sum.add_run("Project Summary\n")
    r_sum_t.bold = True
    r_sum_t.font.size = Pt(9)
    r_sum_t.font.color.rgb = RGBColor(15, 23, 42)
    
    r_sum_b = p_sum.add_run(
        "The system demonstrates full-stack admission management. Connecting Next.js with NestJS "
        "and a normalized MySQL database, it automates student applications and uses database transactions "
        "to prevent seat over-allocation."
    )
    r_sum_b.font.size = Pt(8)
    r_sum_b.font.color.rgb = RGBColor(71, 85, 105)

    # Save document
    out_path = os.path.join(os.path.dirname(__file__), 'PROJECT_REPORT_AND_SCREENSHOTS.docx')
    doc.save(out_path)
    print(f"Document successfully created at: {out_path}")

if __name__ == '__main__':
    create_report()
