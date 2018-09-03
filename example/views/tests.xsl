<xsl:template name="books">
   <h1>Books</h1>
   
   <xsl:value-of select="//book[4]/category_id"/>
   <xsl:value-of select="//book[last()]"/>
   <xsl:value-of select="//*[category_id=1]"/>
   <xsl:value-of select="//*[category_id=2]/title"/>
   <xsl:value-of select="//isbn"/>
   <xsl:value-of select="//title/text()"/>
   <xsl:value-of select="//*[price > 15]"/>
   <xsl:value-of select="//*[contains(title, 'the')]"/>
   <xsl:value-of select="//book[position() < 3]"/>

</xsl:template>